import psycopg2

# Lista de países
countries = [
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita', 'Argelia',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin',
    'Bélgica', 'Belice', 'Benín', 'Bielorrusia', 'Birmania', 'Bolivia', 'Bosnia-Herzegovina', 'Botsuana', 'Brasil',
    'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar',
    'Chad', 'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Congo', 'Corea del Norte', 'Corea del Sur', 'Costa de Marfil',
    'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos',
    'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Esuatini', 'Etiopía', 'Filipinas',
    'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guinea',
    'Guinea Ecuatorial', 'Guinea-Bisáu', 'Guyana', 'Haití', 'Honduras', 'Hungría', 'India', 'Indonesia', 'Irak', 'Irán',
    'Irlanda', 'Islandia', 'Islas Marshall', 'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania',
    'Kazajistán', 'Kenia', 'Kirguistán', 'Kiribati', 'Kosovo', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia',
    'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Macedonia del Norte', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas',
    'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldavia', 'Mónaco', 'Mongolia',
    'Montenegro', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda',
    'Omán', 'Países Bajos', 'Pakistán', 'Palaos', 'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia',
    'Portugal', 'Reino Unido', 'República Centroafricana', 'República Checa', 'República Democrática del Congo',
    'República Dominicana', 'Ruanda', 'Rumania', 'Rusia', 'Samoa', 'San Cristóbal y Nieves', 'San Marino',
    'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe', 'Senegal', 'Serbia', 'Seychelles',
    'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia',
    'Suiza', 'Surinam', 'Tailandia', 'Taiwán', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago',
    'Túnez', 'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay', 'Uzbekistán', 'Vanuatu', 'Vaticano',
    'Venezuela', 'Vietnam', 'Yemen', 'Yibuti', 'Zambia', 'Zimbabue'
]

# Configuración de la conexión a PostgreSQL
host = 'localhost'
database = 'Fud'
user = 'postgres'
password = 'bobesponja48'

# Función para insertar un país en la tabla "contry"
def insert_country(country):
    try:
        # Establecer la conexión a la base de datos
        connection = psycopg2.connect(host=host, database=database, user=user, password=password)

        # Crear un cursor para ejecutar las consultas
        cursor = connection.cursor()

        # Consulta SQL para insertar el país en la tabla "contry"
        sql_query = 'INSERT INTO "Fud".country (name) VALUES (%s);'

        # Ejecutar la consulta con el país actual
        cursor.execute(sql_query, (country,))

        # Confirmar la transacción
        connection.commit()

        # Cerrar el cursor y la conexión
        cursor.close()
        connection.close()

        print(f"País '{country}' insertado correctamente en la tabla 'contry'.")

    except Exception as e:
        print(f"Error al insertar el país '{country}': {e}")
        exit()
        
# Recorrer la lista de países y guardarlos en la base de datos
for country in countries:
    insert_country(country)
