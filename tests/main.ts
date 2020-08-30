import { DateFormat } from "./../src/app/Date";
import { IntAllocator } from "./../src/app/IntAllocator";

/**
 * Welcome to Backyard testing units. Here we test some parts of the code
 * and ensure everything is running as intended. If a run fails, it means
 * a regression has been produced and must be fixed in next versions.
 * All Test Units must inherit this class and run the test code in the 
 * test method. To mark the test as failed, just throw an error.
 */
abstract class Unit {

    public readonly unitType: Tests.TestUnit;

    constructor(type: Tests.TestUnit) {
        this.unitType = type;
    }

    abstract test(): void;
}

/**
 * Test for the IntAllocator class
 */
class IntAllocationTest extends Unit {

    constructor() {
        super(Tests.TestUnit.INT_ALLOC);
    }

    public test() {
        const alloc = new IntAllocator();
        const allocated = [];
        for (let i = 0; i < 10; i++)
            allocated.push(alloc.allocate());
        for (let i = 0; i < 5; i++)
            alloc.release(allocated.shift());
        for (let i = 0; i < 2; i++)
            allocated.push(alloc.allocate());

        for (let i = 0; i < 10; i++) {
            const shouldBeAllocated = i < 2 || i >= 5;
            if ((shouldBeAllocated && !alloc.isAllocated(i)) || (!shouldBeAllocated && alloc.isAllocated(i)))
                throw new Error();
        }
    }
}

/**
 * Test for the IntAllocator class
 */
class DateFormatTest extends Unit {

    constructor() {
        super(Tests.TestUnit.DATE_FORMAT);
    }

    public test() {
        const format = "yyyyyy M ddddd hhhhhhhhhhhhhhh m sssssss S";
        const str = new DateFormat(new Date()).format(format);
        if (str.match(/[^\d\s]/mug) !== null || format.length !== str.length)
            throw new Error();
    }
}

namespace Tests {

    export enum TestUnit {
        DATE_FORMAT = "Date Format",
        INT_ALLOC = "Int Allocation"
    }

    const unitStack: Array<Unit> = [new IntAllocationTest(), new DateFormatTest()];

    export function start() {
        console.log("\x1b[34mStarting tests\x1b[0m");
        let failed = 0;
        let passed = 0;
        const startDate = new Date();

        while (unitStack.length > 0) {
            const startD = new Date();
            const unit = unitStack.shift();
            try {
                unit.test();
                console.log(`\x1b[32m✓ Passed test "${unit.unitType}" in ${new DateFormat(new Date(new Date().valueOf() - startD.valueOf())).format("mm:ss.SSS")}\x1b[0m`);
                passed++;
            } catch (_error) {
                console.log(`\x1b[31m✘ Failed test "${unit.unitType}" in ${new DateFormat(new Date(new Date().valueOf() - startD.valueOf())).format("mm:ss.SSS")}\x1b[0m`);
                failed++;
            }
        }
        console.log(`\x1b[34mFinished in ${new DateFormat(new Date(new Date().valueOf() - startDate.valueOf())).format("mm:ss.SSS")}. ${passed + failed} ${passed + failed > 1 ? "tests were" : "test was"} executed with \x1b[31m${failed} error${failed > 1 ? "s" : ""}\x1b[0m`);
        if (failed > 0)
            throw new Error("Tests have failed. See the information above to see what went wrong");
    }
}

Tests.start();