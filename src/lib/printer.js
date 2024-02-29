const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

// Iniciar la conexión con la impresora
async function print_ticket(commander) {
    // Crear una nueva instancia de la impresora
    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,  // Tipo de impresora (ajusta según tu modelo)
        interface: "printer:/dev/usb/lp0"  // Puerto o interfaz de la impresora
    });

    try {
        // Establecer el texto a imprimir
        printer.alignCenter();
        printer.println("¡Hola, mundo!");
        printer.cut(); // Cortar el papel

        // Enviar el trabajo de impresión a la impresora
        await printer.execute();

        console.log("Impresión completa.");
    } catch (error) {
        console.error("Error al imprimir:", error);
    }
}

module.exports = {
    print_ticket
}