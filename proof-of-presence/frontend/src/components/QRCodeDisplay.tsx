// frontend/src/components/QRCodeDisplay.tsx
import * as QRCodeReact from 'qrcode.react';
const QRCode = QRCodeReact.QRCode;
import { Download, X } from 'lucide-react';

interface Props {
  qrData: string;
  eventName: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ qrData, eventName, onClose }: Props) {
  const qrUrl = `${window.location.origin}/scan?data=${qrData}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${eventName.replace(/\s+/g, '_')}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{eventName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">Scan this QR code to check in</p>

        <div className="bg-white p-8 rounded-xl mb-6 flex justify-center">
          <QRCode
            id="qr-code-svg"
            value={qrUrl}
            size={300}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-white"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}