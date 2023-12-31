use lettre::message::{Attachment, MultiPart, SinglePart};
use lettre::transport::smtp::AsyncSmtpTransport;
use lettre::{
    message::{header::ContentType, Mailbox, MessageBuilder},
    transport::smtp::{
        authentication::{Credentials, Mechanism},
        PoolConfig,
    },
};
use lettre::{AsyncTransport, Tokio1Executor};
use lol_html::{element, HtmlRewriter, Settings};
use qrcode_generator::QrCodeEcc;
use uuid::Uuid;

use crate::config::config;
use crate::error::Error;

fn generate_qrcode_png(uid: Uuid) -> Result<Vec<u8>, Error> {
    qrcode_generator::to_png_to_vec(uid.to_string(), QrCodeEcc::Low, 200)
        .map_err(|e| Error::from(e.to_string()))
}

/// Generate the mail from the template by inserting the `src` attribute of all `<img>` tag with the `qrcode` class.
pub fn generate_mail(template: &str) -> Result<String, Error> {
    let mut output = vec![];

    let mut rewriter = HtmlRewriter::new(
        Settings {
            element_content_handlers: vec![element!("img.qrcode", |el| {
                el.set_attribute("src", "cid:qrcode")?;
                Ok(())
            })],
            ..Settings::default()
        },
        |c: &[u8]| output.extend_from_slice(c),
    );

    rewriter
        .write(template.as_bytes())
        .map_err(Error::from_any)?;

    String::from_utf8(output).map_err(|e| Error::from(e.to_string()))
}

async fn send_mail(
    mail: String,
    mail_address: &str,
    uid: Uuid,
    event_name: &str,
    sender: &AsyncSmtpTransport<Tokio1Executor>,
) -> Result<(), Error> {
    let qrcode = generate_qrcode_png(uid)?;
    let mail_address = mail_address
        .parse::<Mailbox>()
        .map_err(|e| Error::from(e.to_string()))?;

    let message = MessageBuilder::new()
        .from(
            config()
                .smtp_email
                .parse::<Mailbox>()
                .map_err(Error::from_any)?,
        )
        .to(mail_address)
        .subject(format!("Registrations - {}", event_name))
        .header(ContentType::TEXT_HTML)
        .multipart(
            MultiPart::mixed()
                .multipart(
                    MultiPart::related()
                        .singlepart(SinglePart::html(mail))
                        .singlepart(Attachment::new_inline("qrcode".to_owned()).body(
                            qrcode.clone(),
                            ContentType::parse("image/png").map_err(Error::from_any)?,
                        )),
                )
                .singlepart(Attachment::new("qrcode".to_owned()).body(
                    qrcode,
                    ContentType::parse("image/png").map_err(Error::from_any)?,
                )),
        )
        .map_err(Error::from_any)?;

    sender.send(message).await.map_err(Error::from_any)?;

    Ok(())
}

pub async fn send_mail_batch(
    template: &str,
    participants: &[(String, Uuid)],
    event_name: &str,
    ignore_errors: bool,
) -> Result<(), Error> {
    let mail = generate_mail(template)?;
    let sender = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config().smtp_server)
        .map_err(Error::from_any)?
        .credentials(Credentials::new(
            config().smtp_user.clone(),
            config().smtp_password.clone(),
        ))
        .authentication(vec![Mechanism::Plain, Mechanism::Login])
        .pool_config(PoolConfig::default())
        .build();

    for (mail_address, uid) in participants.iter() {
        if let Err(e) = send_mail(
            mail.clone(),
            mail_address.as_str(),
            *uid,
            event_name,
            &sender,
        )
        .await
        {
            if ignore_errors {
                println!("Could not send mail to {mail_address}: {e:?}")
            } else {
                return Err(e);
            }
        }
    }

    Ok(())
}
