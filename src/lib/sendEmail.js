const nodemailer = require('nodemailer'); //this is for send emails 


async function email_to_recover_password(email,token) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = 'Restablecimiento de Password';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #FF002A;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .token-box {
                    border: 2px solid #FF002A;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    margin: 0 auto; /* Centrar el cuadro */
                    max-width: 400px; /* Establecer el ancho máximo */
                }
                .token{
                    font-size: 25px;
                }
            </style>
            <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.2.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Restablecimiento de contraseña</h1>
                </div>
                <div class="content">
                    <p>Hola!! 👋, Somos el equipo de <i class="fi fi-sr-hat-chef"></i> Füd</p>
                    <p>¿Has solicitado restablecer tu contraseña? Utiliza el siguiente token para completar el proceso:</p>
                    <div class="token-box">
                        <strong class="token">${token}</strong>
                    </div>
                    <div><p>Si no has solicitado este restablecimiento, puedes ignorar este correo.</p></div>
                    <p>Saludos, Equipo de Soporte y mucha suerte!! 😉❤️</p>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function welcome_email(email,name) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = '🚀 ¡Bienvenido a Füd Technology! 🚀';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #FF002A;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background-color: #FF002A;
                    color: #fff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .icon {
                    display: block;
                    margin: 0 auto 20px;
                    width: 100px; /* ajusta el tamaño de la imagen según sea necesario */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a Füd Technology!</h1>
                </div>
                <div class="content">
                    <img class="icon" src="https://cdn-icons-png.flaticon.com/256/2274/2274543.png" alt="Ícono de Füd Technology">
                    <hr>
                    <h2 style="color: #FF002A; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Hola, ${name}! 👋</h2>
                    <p>Te damos una cálida bienvenida a la mejor plataforma gastronomica de Mexico. 💪</p>
                    <p>En Füd Technology, estamos comprometidos a proporcionarte la mejor experiencia posible y nos comprometemos a 
                    ofrecerte las herramientas y recursos necesarios para alcanzar tus objetivos.</p>
                    <br>
                    <center>⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</center>
                    <br>
                    <p>Estamos aquí para ayudarte en cada paso del camino. 😉</p>
                    <p>Para comenzar, te invitamos a explorar nuestra plataforma y descubrir todo lo que tenemos para ofrecerte.</p>

                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 🤗</p>
                    <p>¡Gracias por unirte a Füd y esperamos que tengas una experiencia increíble con nosotros! ❤️</p>
                    <br><br>
                    <a class="button" href="https://fud-tech.cloud">Explora Ahora 🚀</a>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function send_email(toEmail, subjectEmail, message) {
    //get the data of the email from the file .env
    const { APP_PASSWORD_EMAIL,APP_EMAIL_EMAIL } = process.env;

    //this is for email google
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: APP_EMAIL_EMAIL,
            pass: APP_PASSWORD_EMAIL
        }
    });
    //we will to connecting with the email 
    /*
    const transport = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true para el puerto 465, false para otros puertos
        auth: {
          user: 'fud-technology@hotmail.com', // Tu dirección de correo electrónico desde donde enviarás el mensaje
          pass: APP_PASSWORD_EMAIL // La contraseña de tu cuenta de correo electrónico
        }
      });*/

    //we will to create the content of the message 
    const mailOptions = {
        from: 'Füd Technology 🛎️',
        to: toEmail,
        subject: subjectEmail,
        html: message
    };

    //send 
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
        } else {
            console.log('Correo electrónico enviado:', info.response);
        }
    });

    return true;
}


module.exports={
    send_email,
    email_to_recover_password,
    welcome_email
};