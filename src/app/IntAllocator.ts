class AllocationError extends Error {

    public name: string;
    public message: string;

    constructor(value: number) {
        super();
        this.name = "AllocationError";
        this.message = `Cannot release not allocated value '${value}'`;
    }

}

export class IntAllocator {
    
    private allocated: Array<number>;

    constructor(data: Array<number> = []) {
        this.allocated = data;
    }

    /**
     * Allocates a new Integer. Returns the allocated value
     */
    public allocate(): number {
        let i = 0;
        while (this.allocated.indexOf(i) >= 0)
            i++;
        this.allocated.push(i);
        return i;
    }

    /**
     * Releases a value of the allocator, to make it usable again
     * @param {number} value the integer to release
     */
    public release(value: number): void {
        const index = this.allocated.indexOf(value);
        if (index < 0)
            throw new AllocationError(value);
        this.allocated.splice(index, 1);
    }

    public isAllocated(value: number): boolean {
        return this.allocated.indexOf(value) >= 0;
    }

    /**
     * Returns a copy of the allocator, containing the same allocated values
     */
    protected copy(): IntAllocator {
        return new IntAllocator(Array.from(this.allocated));
    }
}