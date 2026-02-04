"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PrintReceiptButtonProps {
    shopName: string
    transaction: {
        id: string
        type: string
        displayDateTime: string
        client: string
        item: string
        value: number
    }
}

export function PrintReceiptButton({ shopName, transaction }: PrintReceiptButtonProps) {

    const handlePrint = () => {
        const width = 300
        const height = 600
        const left = (window.screen.width / 2) - (width / 2)
        const top = (window.screen.height / 2) - (height / 2)

        const printWindow = window.open('', '', `width=${width},height=${height},left=${left},top=${top}`)

        if (!printWindow) return

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Recibo</title>
                    <style>
                        body {
                            font-family: 'Courier New', Courier, monospace; /* Thermal style */
                            width: 280px; /* Safe margin for 80mm */
                            margin: 0 auto;
                            padding: 10px;
                            color: #000;
                            background: #fff;
                            font-size: 12px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .shop-name {
                            font-size: 16px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .divider {
                            border-top: 1px dashed #000;
                            margin: 8px 0;
                        }
                        .row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 4px;
                        }
                        .bold {
                            font-weight: bold;
                        }
                        .total {
                            font-size: 14px;
                            font-weight: bold;
                            margin-top: 5px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 15px;
                            font-size: 10px;
                        }
                        @media print {
                            body { margin: 0; padding: 0; }
                            @page { margin: 0; size: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="shop-name">${shopName}</div>
                        <div>Comprovante de ${transaction.type === 'appointment' ? 'Serviço' : 'Venda'}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="row">
                        <span>Data:</span>
                        <span>${transaction.displayDateTime}</span>
                    </div>
                    <div class="row">
                        <span>Cliente:</span>
                        <span>${transaction.client}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div style="margin-bottom: 8px;">
                        <div class="bold">ITENS</div>
                        <div class="row">
                            <span style="max-width: 180px;">${transaction.item}</span>
                            <span>R$ ${transaction.value.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="row total">
                        <span>TOTAL</span>
                        <span>R$ ${transaction.value.toFixed(2)}</span>
                    </div>
                    
                    <div class="footer">
                        <p>Obrigado pela preferência!</p>
                        <p>Volte Sempre</p>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                            // Optional: window.close() after print? browsers usually handle this differently.
                            // keeping it open allows user to retry if print failed.
                        }
                    </script>
                </body>
            </html>
        `

        printWindow.document.write(htmlContent)
        printWindow.document.close()
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handlePrint}
            title="Imprimir Recibo"
            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
        >
            <Printer size={16} />
        </Button>
    )
}
