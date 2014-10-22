/// <reference path="../types/nodeunit.d.ts" />
import test_utils  = require('./test_utils');
import firebase_io = require('./firebase_io');
import async = require('async');
import fs = require('fs');

import bf2firebase = require('../src/bf2firebase');
import machine = require('../src/machine');

export function testSetup(test:nodeunit.Test):void{
    async.series([
        firebase_io.setValidationRules.bind(null, fs.readFileSync("rules/rules.json"))
    ], test.done.bind(null));
}

export function testMem(test:nodeunit.Test):void{
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/test_mem", {}, test),

        test_utils.assert_can_write.bind(null, "tom", "/test_mem/index", 1, test), //todo this is a hole, last_access should not be changable without updating memory contents

        test_utils.assert_can_write.bind(null, "tom", "/test_mem", {"1": 5, "index":1}, test),

        test_utils.assert_can_write.bind(null, "tom", "/test_mem", {"1": 5, "index":2}, test), //cursor can be updated

        test_utils.assert_cant_write.bind(null, "tom", "/test_mem", {"1": 4, "index":2}, test), //values can;t be updated off cursor

    ], test.done.bind(null));
}

export function testShifts(test:nodeunit.Test):void{

    var code: string[] = bf2firebase.convert("><", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc: "program",
            mem:  {index:0, "0":0},
            input: {},
            output: {},
            pc:      0
        }, test),

        //check program counter must be shifted correctly
        test_utils.assert_cant_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:1, "0":0},
            input:  {},
            output: {},
            pc:     0
        }, test),

        //check data index must be shifted correctly
        test_utils.assert_cant_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {},
            output: {},
            pc:     1
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:1, "0":0},
            input:  {},
            output: {},
            pc:     1
        }, test),

        //now check we can shift back with the second operand
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {},
            output: {},
            pc:     2
        }, test)

    ], test.done.bind(null));
}


export function testShifts2(test: nodeunit.Test) {
    var code: string[] = bf2firebase.convert("><", true);

    var state0: machine.MachineState = new machine.MachineState(
        code,
        0,
        {index:0, "0":0},
        {},
        {}
    );

    var state1: machine.MachineState = new machine.MachineState(
        code,
        1,
        {index:1, "0":0},
        {},
        {}
    );

    var state2: machine.MachineState = new machine.MachineState(
        code,
        2,
        {index:0, "0":0},
        {},
        {}
    );


    test.deepEqual(machine.step(state0), state1);
    test.deepEqual(machine.step(state1), state2);

    test.done();
}

export function testIncDec(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+-", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {},
            output: {},
            pc:     0
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":1},
            input:  {},
            output: {},
            pc:     1
        }, test),

        //now check we can shift back with the second operand
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {},
            output: {},
            pc:     2
        }, test)

    ], test.done.bind(null));
}

export function testIncDec2(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+-", true);

    var state0: machine.MachineState = new machine.MachineState(
        code,
        0,
        {index:0, "0":0},
        {},
        {}
    );

    var state1: machine.MachineState = new machine.MachineState(
        code,
        1,
        {index:0, "0":1},
        {},
        {}
    );

    var state2: machine.MachineState = new machine.MachineState(
        code,
        2,
        {index:0, "0":0},
        {},
        {}
    );
    test.deepEqual(machine.step(state0), state1);
    test.deepEqual(machine.step(state1), state2);

    test.done();
}


export function testInput(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert(",", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0}, //todo try and make mem lazily
            input:  {index:0, "0":5},
            output: {},
            pc:     0
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":5},
            input:  {index:1, "0":5},
            output: {},
            pc:     1
        }, test)

    ], test.done.bind(null));
}

export function testInput2(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert(",", true);

    var state0: machine.MachineState = new machine.MachineState(
        code,
        0,
        {index:0, "0":0},
        {index:0, "0":5},
        {}
    );

    var state1: machine.MachineState = new machine.MachineState(
        code,
        1,
        {index:0, "0":5},
        {index:1, "0":5},
        {}
    );
    test.deepEqual(machine.step(state0), state1);
    test.done();
}

export function testOutput(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+.", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     0
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":1},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     1
        }, test),

        //check a correct instruction executes correctly
        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":1},
            input:  {index:0, "0":0},
            output: {index:1, "0":1}, //todo we dangerously loosened security on the output in order to move index and modify in one operation
            pc:     2
        }, test)

    ], test.done.bind(null));
}

export function testOutput2(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("+.", true);

    var state0: machine.MachineState = new machine.MachineState(
        code,
        0,
        {index:0, "0":0},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state1: machine.MachineState = new machine.MachineState(
        code,
        1,
        {index:0, "0":1},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state2: machine.MachineState = new machine.MachineState(
        code,
        2,
        {index:0, "0":1},
        {index:0, "0":0},
        {index:1, "0":1}
    );
    test.deepEqual(machine.step(state0), state1);
    test.deepEqual(machine.step(state1), state2);
    test.done();
}

export function testJmp(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("++[-][---]", true);

    console.log(code);
    async.series([
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc:"program",
            mem:    {index:0, "0":0},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     0
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":1},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     1
        }, test),

        test_utils.assert_admin_can_write.bind(null, "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":2},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     2
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":2},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     3
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":1},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     4
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":1},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     3
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":0},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     4
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":0},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     5
        }, test),

        test_utils.assert_can_write.bind(null,  "tom", "/machine", {
            program_loc: "program",
            mem:    {index:0, "0":0},
            input:  {index:0, "0":0},
            output: {index:0, "0":0},
            pc:     10
        }, test)

    ], test.done.bind(null));
}

export function testJmp2(test:nodeunit.Test):void{
    var code:string[] = bf2firebase.convert("++[-][---]", true);

    var state0: machine.MachineState = new machine.MachineState(
        code,
        0,
        {index:0, "0":0},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state1: machine.MachineState = new machine.MachineState(
        code,
        1,
        {index:0, "0":1},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state2: machine.MachineState = new machine.MachineState(
        code,
        2,
        {index:0, "0":2},
        {index:0, "0":0},
        {index:0, "0":0}
    );
    var state3: machine.MachineState = new machine.MachineState(
        code,
        3,
        {index:0, "0":2},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state4: machine.MachineState = new machine.MachineState(
        code,
        4,
        {index:0, "0":1},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state5: machine.MachineState = new machine.MachineState(
        code,
        3,
        {index:0, "0":1},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state6: machine.MachineState = new machine.MachineState(
        code,
        4,
        {index:0, "0":0},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state7: machine.MachineState = new machine.MachineState(
        code,
        5,
        {index:0, "0":0},
        {index:0, "0":0},
        {index:0, "0":0}
    );

    var state8: machine.MachineState = new machine.MachineState(
        code,
        10,
        {index:0, "0":0},
        {index:0, "0":0},
        {index:0, "0":0}
    );
    test.deepEqual(machine.step(state0), state1);
    test.deepEqual(machine.step(state1), state2);
    test.deepEqual(machine.step(state2), state3);
    test.deepEqual(machine.step(state3), state4);
    test.deepEqual(machine.step(state4), state5);
    test.deepEqual(machine.step(state5), state6);
    test.deepEqual(machine.step(state6), state7);
    test.deepEqual(machine.step(state7), state8);
    test.done();
}

/*
export function testHelloWorld(test:nodeunit.Test):void{

    var code:string[] = bf2firebase.convert(fs.readFileSync("programs/hello.bf").toString(), true);

    console.log(code);
    async.series([
        WRONG LOCATIONS
        test_utils.assert_admin_can_write.bind(null, "/program", code, test),
        test_utils.assert_admin_can_write.bind(null, "/memory", {}, test),
        test_utils.assert_admin_can_write.bind(null, "/pc",     0, test),
        test_utils.assert_admin_can_write.bind(null, "/input",  {pos:0}, test),
        test_utils.assert_admin_can_write.bind(null, "/output", {pos:0}, test),

        //check from field must be correct
        test_utils.assert_cant_write.bind(null,  "tom", "/", {
            program_loc: []
        }, test)


    ], test.done.bind(null));
}*/
