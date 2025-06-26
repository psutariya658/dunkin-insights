import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

type EmployeeCardProps = {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
  averageRating: number | null;
  reviewCount: number | null;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${
          index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
      />
    ))}
  </div>
);

export function EmployeeCard({
  id,
  name,
  position,
  imageUrl,
  averageRating,
  reviewCount,
}: EmployeeCardProps) {
  return (
    <Link href={`/employees/${id}/reviews`} className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Photo of ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white font-bold text-4xl mb-2">DD</div>
                <div className="text-white/80 text-sm">Dunkin' Team</div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mb-3">{position}</p>
          <div className="mt-auto flex items-center">
            {averageRating != null && averageRating > 0 ? (
              <>
                <StarRating rating={averageRating} />
                <span className="ml-2 text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No reviews yet</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
