function validate(schema, target = 'body') {
    return (req, res, next) => {
        const data = req[target];
        
        //paso 1 verificar que haya datos
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No data found' })
        }

        //paso 2 validar contra el schema con opciones
        const { error, value } = schema.validate(data, {
            abortEarly: false, 
            stripUnknown: true
        })

        //paso 4 si hay errores de validacion , devolver 400 con mensaje
        if(error) {
            return res.status(400).json({
                message: 'Error de validacion en ${target}',
                errores: error.details.map(err => err.message)
            })
        }

        //paso 4 Reemplazar el objeto original con datos limpios
        req[target] = value;

        //continuamos...
        next();
    }
}
export default validate;