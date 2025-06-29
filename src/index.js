//import 'bcrypt';
import 'dotenv/config';
import app from "./app.js";
import logger from "./logs/logger.js";
import config from "./config/env.js";
import { sequelize } from './database/database.js';

async function main(){
    await sequelize.sync({ force: false });//console.log('======>', config.PORT);
    const port = config.PORT;//app.listen(process.env.PORT) ;
    app.listen(port);//console.log('Server is running on http://localhost:');
    //logger.info('Server started on port ' + process.env.PORT);
    logger.info('Server started on port ' + port);
    logger.error('This is a error message');
    logger.warn('This is a warning message');    //logger.debug('This is a debug message');
    logger.fatal('This is a fatal message');    //logger.trace('This is a trace message');

}

main();
