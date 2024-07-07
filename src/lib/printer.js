/*
const usb = require('usb');
const escpos = require('escpos');
const Bluetooth = require('escpos-bluetooth');

// Función para imprimir un ticket
async function print_ticket(commander,total) {
    console.log(`Fecha: $${commander.date}\n`)
    console.log(`¡Bienvenido!\n`)
    console.log(`id branch: ${commander.id_branch}`)
    console.log(`id employee: ${commander.id_branch}`)
    console.log('--------------------------------\n')
    console.log(commander.commanderDish)
    console.log('--------------------------------\n')
    console.log('--------------------------------\n')
    console.log(`Total:                       $${commander.total}\n`)
    console.log(`Dinero recibido:                       $${commander.moneyReceived}\n`)
    console.log('--------------------------------\n')

    const address = '01:23:45:67:89:AB'; // Reemplaza con la dirección MAC de tu impresora
    const channel = 1;
    const device = new Bluetooth(address, channel);
    const printer = new escpos.Printer(device);

    // Abre el dispositivo USB y ejecuta la impresión
    device.open(function () {
        printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text(`¡Bienvenido!\n`)
            .text('--------------------------------\n')
            .text(commander)
            .text('--------------------------------\n')
            .text('--------------------------------\n')
            .text(`Total:                       $${total}\n`)
            .barcode('1234567', 'EAN8')
            .text('--------------------------------\n')
            .cut()
            .close();
    });
}*/
const ThermalPrinter = require('thermalprinter');
//const printer = require('printer');

async function print_ticket(commander) {
    try {
        const text = `
        Fecha: ${commander.date}
        ¡Bienvenido!
        --------------------------------
        id sucursal: ${commander.id_branch}
        id empleado: ${commander.id_employee}
        --------------------------------
        ${commander.commanderDish}
        --------------------------------
        Total:                       $${commander.total}
        Dinero recibido:             $${commander.moneyReceived}
        --------------------------------
        `;

        console.log(text); // Mostrar el texto en la consola

        const address='tcp://192.168.1.100'
        const type='epson'
        const printer = new ThermalPrinter({
            type: type, // Tipo de impresora (p. ej., epson, star, etc.)
            interface: address, // Dirección IP de la impresora
            characterSet: 'SLOVENIA', // Conjunto de caracteres (opcional, dependiendo de la impresora)
            lineCharacter: '=', // Carácter de línea para separadores (opcional)
        });

        // Conectar e inicializar la impresora
        await printer.init();

        // Configurar el contenido del ticket
        printer.println(`Fecha: ${commander.date}`);
        printer.println('¡Bienvenido!');
        printer.println(`id branch: ${commander.id_branch}`);
        printer.println(`id employee: ${commander.id_employee}`);
        printer.println('--------------------------------');
        printer.println(`${commander.commanderDish}`);
        printer.println('--------------------------------');
        printer.println('--------------------------------');
        printer.println(`Total:                       $${commander.total}`);
        printer.println(`Dinero recibido:             $${commander.moneyReceived}`);
        printer.println('--------------------------------');

        // Cortar el ticket (si es necesario)
        printer.cut();

        // Enviar a imprimir
        await printer.execute();

        console.log('Impresión exitosa');

    } catch (error) {
        console.error('Error al imprimir:', error);
    }
}

module.exports = {
    print_ticket
};