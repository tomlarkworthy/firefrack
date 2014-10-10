/// <reference path="../types/nodeunit.d.ts" />
import test_utils  = require('./test_utils');
import firebase_io = require('./firebase_io');
import async = require('async');
import fs = require('fs');

import bf2firebase = require('../src/bf2firebase');

export function testSetup(test:nodeunit.Test):void{
    async.series([
        firebase_io.setValidationRules.bind(null, fs.readFileSync("rules/rules.json"))
    ], test.done.bind(null));
}

export function testMem(test:nodeunit.Test):void{
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/test_mem", {}, test),

        test_utils.assert_can_write.bind(null, "tom", "/test_mem/last_access", 1, test), //todo this is a hole, last_access should not be changable without updating memory contents

        test_utils.assert_can_write.bind(null, "tom", "/test_mem", {"1": 5, "last_access":1}, test),

        test_utils.assert_cant_write.bind(null, "tom", "/test_mem", {"1": 5, "last_access":2}, test), //last_access must be updated

    ], test.done.bind(null));
}
/*
export function testBuffer(test:nodeunit.Test):void{
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/test_buffer", {
            prefix: "#123",
            suffix: "789#",
            value: 456,
            index: 1
        }, test),

        test_utils.assert_can_write.bind(null, "tom", "/test_buffer", {
            prefix: "#",
            suffix: "456789#",
            value: 123,
            index: 0
        }, test),

        test_utils.assert_can_write.bind(null, "tom", "/test_buffer", {
            prefix: "#123456",
            suffix: "#",
            value: 789,
            index: 2
        }, test),

        test_utils.assert_cant_write.bind(null, "tom", "/test_buffer", {
            prefix: "#123",
            suffix: "789#",
            value: 444, //wrong number
            index: 1
        }, test),

        test_utils.assert_cant_write.bind(null, "tom", "/test_buffer", {
            prefix: "#123",
            suffix: "789#",
            value: 456,
            index: 0//wrong index
        }, test)
    ], test.done.bind(null));
}*/

/*
export function testShifts(test:nodeunit.Test):void{

    var code:string[] = bf2firebase.convert("><", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"101#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      0
        }, test),

        //check data must be shifted correctly
        test_utils.assert_cant_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#100", suffix:"#", index:1, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      1
        }, test),

        //check program counter must be shifted correctly
        test_utils.assert_cant_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#100", suffix:"#", index:1, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      0
        }, test),

        //check data index must be shifted correctly
        test_utils.assert_cant_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#100", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      1
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#100", suffix:"#", index:1, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      1
        }, test),

        //now check we can shift back with the second operand
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"101#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      2
        }, test)

    ], test.done.bind(null));
}

export function testIncDec(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+-", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      0
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      1
        }, test),

        //now check we can shift back with the second operand
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:0},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      2
        }, test)

    ], test.done.bind(null));
}

export function testInput(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert(",", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"100#", index:0, value:101},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      0
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#101", suffix:"#", index:1, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:0},
            pc:      1
        }, test)

    ], test.done.bind(null));
}
export function testOutput(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+.", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"100#", index:0, value:100},
            pc:      0
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"100#", index:0, value:100},
            pc:      1
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#101", suffix:"#", index:1, value:100},
            pc:      2
        }, test)

    ], test.done.bind(null));
}


export function testJmp(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("++[-][---]", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      0
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      1
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:102},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      2
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:102},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      3
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      4
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:101},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      3
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      4
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      5
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program: "program",
            data: {prefix:"#", suffix:"#", index:0, value:100},
            input: {prefix:"#", suffix:"#", index:0, value:100},
            output: {prefix:"#", suffix:"#", index:0, value:100},
            pc:      10
        }, test)

    ], test.done.bind(null));
}


export function testHelloWorld(test:nodeunit.Test):void{

    var code:string[] = bf2firebase.convert(fs.readFileSync("programs/hello.bf").toString(), true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/memory", {}, test),
        test_utils.assert_admin_can_write.bind(null, "/pc",     0, test),
        test_utils.assert_admin_can_write.bind(null, "/input",  {pos:0}, test),
        test_utils.assert_admin_can_write.bind(null, "/output", {pos:0}, test),

        //check from field must be correct
        test_utils.assert_cant_write.bind(null,  "tom", "/", {
            program: []
        }, test)


    ], test.done.bind(null));
}
*/