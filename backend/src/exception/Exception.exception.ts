import { InternalServerErrorException, BadRequestException, NotFoundException } from "@nestjs/common";

export class ExceptionResponse extends Error {
    returnError(error: Error, ext_message?: string) {
        const errorMessage = error.message.split('\n').at(-1);
        console.log('Error Message:', errorMessage);

        if (
            errorMessage.includes('No record was found') 
        ) {
            const returnValue = new NotFoundException(`${ext_message} not found!`);
            return returnValue.getResponse();
        } else if (
            errorMessage.includes('Unknown argument')   
        ) {
            const returnValue = new BadRequestException(`Invalid field in update data for ${ext_message}.`);
            return returnValue.getResponse();
        } else if (
<<<<<<< HEAD
            errorMessage.includes('Foreign key constraint')
=======
            errorMessage.includes('Foreign key constraint') ||
            errorMessage.includes('fkey')
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        ) {
            const returnValue = new BadRequestException(`Foreign key constraint failed for ${ext_message}.`);
            return returnValue.getResponse();
        }

        const returnValue = new InternalServerErrorException(`Could not update ${ext_message} with error:\n ${errorMessage}`);
        return returnValue.getResponse();
    }
}