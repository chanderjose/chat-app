import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

interface UsersListSkeletonProps {
    count: number
}

export function UsersListSkeleton({ count }: UsersListSkeletonProps) {
    return (
        <SkeletonTheme baseColor="#ababab" highlightColor="#838383">
            {Array.from({ length: count }).map((_, i) => (
                <div className='flex items-center gap-3 mb-3' key={i}>
                    <div className="flex items-center justify-center w-10 h-10">
                        <Skeleton circle={true} width={40} height={40} />
                    </div>
                    <span className="font-medium truncate flex-1"><Skeleton /></span>
                </div>
            ))}
        </SkeletonTheme>
    );
}
