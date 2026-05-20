import { useState, type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card"

interface CounterProps {
    initialCount?: number;
}

export default function Counter({ initialCount = 0 }: CounterProps): ReactElement {
    const [count, setCount] = useState<number>(initialCount);

    const increase = (): void => {
        setCount(prevCount => prevCount + 1);
    };

    const decrease = (): void => {
        setCount(prevCount => prevCount - 1);
    };

    return (
        <Card size="sm" className="w-full max-w-sm">
            <CardContent>
                <h1 className='py-20 text-center text-8xl font-extrabold tracking-tight text-balance'>
                    {count}
                </h1>
            </CardContent>
            <CardFooter className='flex justify-center gap-4 w-full'>
                <Button type='button' variant='outline' className='min-w-[100px] min-h-[50px] text-4xl' onClick={decrease} disabled={count === 0}>-</Button>
                <Button type='button' className='min-w-[100px] min-h-[50px] text-4xl text-white' onClick={increase}>+</Button>
            </CardFooter>
        </Card>
    );
}
