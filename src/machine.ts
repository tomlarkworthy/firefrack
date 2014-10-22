function clone(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
}

export class MachineState {
    constructor(public program: string[], // precompiled program
                public pc: number, // program counter
                public mem: {[addr: string]: number}, //dictionary of addresses (numbers as strings) to values (numbers), the current mem location is held under the address "index"
                public input: {[addr: string]: number}, //dictionary of addresses (numbers as strings) to values (numbers), the current mem location is held under the address "index"
                public output: {[addr: string]: number}) {}
}


export function step (prev: MachineState): MachineState {
    var next: MachineState = clone(prev);
    var instr = prev.program[prev.pc];
    next.pc = prev.pc + 1;

    if (instr == '>') {
        next.mem['index'] = prev.mem['index'] + 1;
    } else if (instr == '<') {
        next.mem['index'] = prev.mem['index'] - 1;
    } else if (instr == '+') {
        next.mem[next.mem['index'] + ''] = prev.mem[next.mem['index'] + ''] + 1
    } else if (instr == '-') {
        next.mem[next.mem['index'] + ''] = prev.mem[next.mem['index'] + ''] - 1
    } else if (instr == ',') {
        next.mem[next.mem['index'] + ''] = prev.input[prev.input['index'] + ''];
        next.input['index'] = prev.input['index'] + 1;
    } else if (instr == '.') {
        next.output[prev.output['index'] + ''] = prev.mem[prev.mem['index'] + ''];
        next.output['index'] = prev.output['index'] + 1;
    } else if (parseInt(instr) > 0 && next.mem[next.mem['index'] + ''] == 0) {
        next.pc = parseInt(instr); //jmp
    } else if (parseInt(instr) > 0 && next.mem[next.mem['index'] + ''] != 0) {
        //let pc skip on
    } else if (parseInt(instr) < 0 && next.mem[next.mem['index'] + ''] != 0) {
        next.pc = - parseInt(instr); //jmp
    } else if (parseInt(instr) < 0 && next.mem[next.mem['index'] + ''] == 0) {
        //let pc skip on
    } else {
        throw new Error('unrecognised instruction' + instr);
    }

    return next
}