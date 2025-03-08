// file = Html5QrcodePlugin.jsx
import {
  Html5QrcodeCameraScanConfig,
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from 'html5-qrcode';
import { useEffect } from 'react';

export const qrcodeRegionId = 'html5qr-code-full-region';

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodeCameraScanConfig) => {
  let config: Html5QrcodeCameraScanConfig = { fps: undefined };
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};

export default function QrCodeScanner(
  props: Html5QrcodeCameraScanConfig & {
    verbose?: boolean;
    qrCodeSuccessCallback?: QrcodeSuccessCallback;
    qrCodeErrorCallback?: QrcodeErrorCallback;
  }
) {
  useEffect(() => {
    // when component mounts
    const config = createConfig(props);
    const verbose = props.verbose === true;
    // Suceess callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw 'qrCodeSuccessCallback is required callback.';
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose
    );
    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error('Failed to clear html5QrcodeScanner. ', error);
      });
    };
  }, []);

  return <div className="qr-code" id={qrcodeRegionId} />;
}
