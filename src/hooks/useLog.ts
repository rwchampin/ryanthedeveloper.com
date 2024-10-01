import { useEffect } from 'react';

type LogType = 'log' | 'info' | 'warn' | 'error';

const styles = {
    log: 'color: black; background-color: white;',
    info: 'color: blue; background-color: white;',
    warn: 'color: orange; background-color: white;',
    error: 'color: red; background-color: white;',
};

const useLogger = ( type = "log", message: string ): void => {
    useEffect( () => {
        console[ type ]( `%c${ message }`, styles[ type ] );

        if ( type === 'error' ) {
            writeErrorToFile( message );
        }
    }, [ type, message ] );
};

const writeErrorToFile = ( error: string ): void => {
    const timestamp = new Date().toISOString();
    const stackTrace = new Error().stack;

    if ( !checkFileExists( 'error.log' ) ) {
        createFile( 'error.log' );
    }

    appendToFile( 'error.log', `${ timestamp }\n${ stackTrace }\n${ error }\n` );
};

const checkFileExists = ( filename: string ): boolean => {
    // Implement the logic to check if the file exists
    // You can use a server-side API or a client-side library like fs-extra
    // Example: return fs.existsSync(filename);
};

const createFile = ( filename: string ): void => {
    // Implement the logic to create the file
    // You can use a server-side API or a client-side library like fs-extra
    // Example: fs.writeFileSync(filename, '');
};

const appendToFile = ( filename: string, content: string ): void => {
    // Implement the logic to append content to the file
    // You can use a server-side API or a client-side library like fs-extra
    // Example: fs.appendFileSync(filename, content);
};

export default useLog;