import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeModal({ url, t, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.qrTitle}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{t.qrTitle}</h2>

        <QRCodeSVG
          value={url}
          size={220}
          bgColor="var(--cream)"
          fgColor="var(--brown)"
          level="M"
          aria-label={`QR code pour rejoindre la session — ${url}`}
        />

        <p className="text-center text-muted" style={{ fontSize: '0.8rem' }}>
          {url}
        </p>

        <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ width: 'auto' }}>
          ✕ Fermer
        </button>
      </div>
    </div>
  )
}
