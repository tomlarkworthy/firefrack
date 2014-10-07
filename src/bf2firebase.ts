/// <reference path="../types/js-yaml.d.ts" />
/// <reference path="../types/node.d.ts" />
/// <reference path="../types/optimist.d.ts" />
var optimist = require('optimist'); //something weird going on, can't import it properly


import fs = require("fs");
import path = require('path');
//import optimist = require('optimist');


var argv = optimist
  .usage('blaze <file>')
  .boolean('v')
  .describe('v', 'enable debug output')
  .argv;



var file = argv._[0];


export function convert(bfcode:string, debug: boolean):any[]{
    var fcode:any[] = [];
    var temp_stack:number[] = [];

    for(var i =0; i<bfcode.length;i++){
        var op = bfcode.substring(i, i+1);
        fcode.push(op);

        if (op == '['){
			temp_stack.push(i);
		}
		if (op == ']'){
			if (temp_stack.length == 0) throw Error('Parsing error: ] with no matching [');
			var target:number = temp_stack.pop();
			fcode[i] = (-target - 1);
			fcode[target] = i+1;
		}
    }
    if (temp_stack.length > 0) throw Error('Parsing error: [ with no matching ]');
    return fcode;
}

/*
if(file){
    console.log("converting ", file, " to virtualbrainfuck code");

    var bfcode:string = fs.readFileSync(file).toString();
    convert(bfcode, argv['v']);
}else{
    console.log("you must specify a filepath containing brainfuck code")
}*/


