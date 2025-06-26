import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface EmployeeAvatarProps extends Omit<ImageProps, 'src' | 'alt'> {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

export function EmployeeAvatar({ 
  name, 
  imageUrl, 
  className = '',
  ...props 
}: EmployeeAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // If there's no image URL or there was an error loading the image
  if (!imageUrl || imageError) {
    return (
      <div 
        className={`relative flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-100 ${className}`}
        style={props.width && props.height ? undefined : { width: '100%', height: '100%' }}
      >
        <span className="text-2xl font-bold text-orange-400">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      onError={() => setImageError(true)}
      className={`object-cover ${className}`}
      {...props}
    />
  );
}
