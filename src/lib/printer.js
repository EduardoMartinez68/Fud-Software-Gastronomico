const usb = require('usb');
const escpos = require('escpos');

// Función para imprimir un ticket
async function print_ticket(commander) {
    const USB_VENDOR_ID = 0x1234; // Reemplaza 0x1234 con el Vendor ID de tu impresora USB
    const USB_PRODUCT_ID=0x1234;
    
    // Encuentra el dispositivo USB con el Vendor ID y el Product ID específicos
    const devices = usb.getDeviceList();
    const device = devices.find(device => device.deviceDescriptor.idVendor === USB_VENDOR_ID && device.deviceDescriptor.idProduct === USB_PRODUCT_ID);

    if (!device) {
        console.error('No se encontró ningún dispositivo USB con los IDs especificados.');
        return;
    }

    // Crea una instancia de la impresora utilizando el dispositivo USB
    const printer = new escpos.Printer(device);

    // Abre el dispositivo USB y ejecuta la impresión
    device.open(function () {
        printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text('¡Bienvenido a nuestra tienda!\n')
            .text('--------------------------------\n')
            .text(commander)
            .text('--------------------------------\n')
            .text('--------------------------------\n')
            .text('Total:                       $60\n')
            .text('--------------------------------\n')
            .cut()
            .close();
    });
}

module.exports = {
    print_ticket
};