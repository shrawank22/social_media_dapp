import { useMediaQuery } from "@chakra-ui/react"
import QR from "qrcode.react"

export const QRCode = ({ invitationUrl, connectionState }) => {
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
    const isLarge = useMediaQuery({ query: "(max-width: 1242px)" })

    const renderQRCode = invitationUrl && (
        <div className="relative m-auto rounded-lg bg-white p-4">
            <QR value={invitationUrl} size={isMobile ? 192 : isLarge ? 212 : 256} level={'M'} />
        </div>
    )

    return <div className="m-auto shadow-lg rounded-lg">{renderQRCode}</div>
}
