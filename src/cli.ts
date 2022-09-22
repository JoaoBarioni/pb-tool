import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';
import protobuf from 'protobufjs';
import fuzzypath from 'inquirer-fuzzy-path';
import { parseMessageNames } from './protobuf';

export function parseArgs() {
    return arg({
        '--file': String,
        '--help': Boolean,

        '-f': '--file',

        '-h': '--help',
    });
}
export async function chooseMessage(_messages: string[]) {
    inquirer.registerPrompt('fuzzypath', fuzzypath);
    const messages = ['Enter name', ..._messages];
    const hexOrList = ["ENTER YOUR HEX", new inquirer.Separator(), "LIST OF PROTOS"];
    const listOrFile = ["SELECT YOUR DIRECTORY OF PROTOS", new inquirer.Separator(), "ENTER YOUR PROTO FILE"];

    const directoryPath = 'C:\\Users\\mindtech04\\Desktop';

    const result = await inquirer
        .prompt({
            type: 'list',
            name: 'message',
            message: 'Choose a message to parse',
            choices: hexOrList,
        });
    if (result.message === 'ENTER YOUR HEX') {
        const hex = await inquirer.prompt({
            type: 'input',
            name: 'hex',
            message: 'Enter message hexadecimal',
            transformer: (value: string) => {
                return Buffer.from(value, 'hex').toString('utf8');
            }
        });
        return hex.hex;
    }
    if (result.message === 'LIST OF PROTOS') {
        const ListOrProtoFile = await inquirer
            .prompt({
                type: 'list',
                name: 'listOfProtos',
                message: 'Choose a message to parse',
                choices: listOrFile,
            });
        if (ListOrProtoFile.listOfProtos === 'SELECT YOUR DIRECTORY OF PROTOS') {
            const directoryFile = await inquirer
                .prompt([
                    {
                        type: 'fuzzypath',
                        name: 'protoFile',
                        itemType: 'file',
                        message: 'Choose a proto file',
                        rootPath: directoryPath,
                        excludeFilter: nodePath => !nodePath.endsWith('.proto'),
                        suggestOnly: true,
                        depthLimit: 4,
                        // default: 'Proto files: ',
                        validate: (value: string) => {
                            if (value.endsWith('.proto')) {
                                return true;
                            }
                            return 'Please select a proto file';
                        },
                    }
                ]);
            return directoryFile.protoFile;
        }
        if (ListOrProtoFile.listOfProtos === 'ENTER YOUR PROTO FILE') {
            const fileProto = await inquirer.prompt({
                type: 'list',
                name: 'fileProto',
                message: 'Select your proto file',
                choices: messages,
                validate: (input: string) => (_messages.includes(input) ? true : 'Message does not exist'),
            });
            return fileProto.fileProto;
        }
        return ListOrProtoFile.listOfProtos;
    }
    return result.message;
}

function pbTypeToInput(type: string) {
    switch (type) {
        case 'int32':
        case 'int64':
        case 'uint32':
        case 'uint64':
        case 'sint32':
        case 'sint64':
        case 'fixed32':
        case 'fixed64':
        case 'sfixed32':
        case 'sfixed64':
        case 'double':
        case 'float':
            return 'number';
        case 'bool':
            return 'confirm';
        case 'string':
            return 'input';
        case 'bytes':
            return 'input';
        default:
            return 'string';
    }
}
export async function inputParamsSelected(message: protobuf.Type) {
    const params = await inquirer.prompt(
        message.fieldsArray.map((field) => ({
            type: pbTypeToInput(field.type),
            name: field.name,
            message: field.name,
        }))
    );
    return params;
}
export async function inputParams(message: protobuf.Type) {
    const params = await inquirer.prompt(
        message.fieldsArray.map((field) => ({
            type: pbTypeToInput(field.type),
            name: field.name,
            message: field.name,
        }))
    );
    return params;
}