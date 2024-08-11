'use server';

import { createTransport } from 'nodemailer';
import { MAIL } from './config';
import { injectTestQrCode } from './qrcode';

const transporter = createTransport(MAIL.transporter);

export async function sendTestMail(
  template: string,
  address: string
): Promise<boolean> {
  const result = await transporter.sendMail({
    from: MAIL.from,
    to: address,
    subject: 'Clicketing - Test email',
    html: injectTestQrCode(template),
  });

  return result.accepted.length > 0;
}
