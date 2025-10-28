'use client';

import type { FC } from 'react';

export interface PhotoAttachmentsProps {
  photoUris: string[];
  onAddPhoto?: () => void;
  onRemovePhoto?: (index: number) => void;
  editable?: boolean;
}

/**
 * Photo attachment UI is available only in the native application.
 * The web implementation is deferred, so this component renders nothing for now.
 */
const PhotoAttachments: FC<PhotoAttachmentsProps> = () => null;

export default PhotoAttachments;
