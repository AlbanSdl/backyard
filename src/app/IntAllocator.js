class AllocationError extends Error {

    constructor(value) {
        super();
        this.name = "AllocationError";
        this.message = `Cannot release not allocated value '${value}'`;
    }

}

class IntAllocator {
    
    constructor(data=[]) {
        this.allocated = data;
    }

    /**
     * Allocates a new Integer. Returns the allocated value
     */
    allocate() {
        let i = 0;
        while (this.allocated.indexOf(i) >= 0)
            i++;
        this.allocated.push(i);
        return i;
    }

    /**
     * Releases a value of the allocator, to make it usable again
     * @param {Number} value the integer to release
     */
    release(value) {
        const index = this.allocated.indexOf(value);
        if (index < 0)
            throw new AllocationError(value);
        this.allocated.splice(index, 1);
    }

    isAllocated(value) {
        return this.allocated.indexOf(value) >= 0;
    }

    /**
     * Returns a copy of the allocator, containing the same allocated values
     */
    copy() {
        return new IntAllocator(Array.from(this.allocated));
    }
}

module.exports.IntAllocator = IntAllocator;