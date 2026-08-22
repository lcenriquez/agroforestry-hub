import { useEffect, useMemo, useRef } from 'react';

import { Box, Button, IconButton, Image, SimpleGrid, Text } from '@chakra-ui/react';
import { Trash, UploadSimple } from '@phosphor-icons/react';

interface PhotoUploaderProps {
	files: File[];
	onChange: (files: File[]) => void;
	maxFiles: number;
}

export default function PhotoUploader({ files, onChange, maxFiles }: PhotoUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const previews = useMemo(() => files.map(file => URL.createObjectURL(file)), [files]);

	useEffect(() => {
		return () => previews.forEach(url => URL.revokeObjectURL(url));
	}, [previews]);

	function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
		const selected = Array.from(event.target.files ?? []);
		onChange([...files, ...selected].slice(0, maxFiles));
		event.target.value = '';
	}

	function removeFile(index: number) {
		onChange(files.filter((_, i) => i !== index));
	}

	return (
		<Box>
			<input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFilesSelected} />
			<Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={files.length >= maxFiles}>
				<UploadSimple /> Agregar fotos ({files.length}/{maxFiles})
			</Button>
			{files.length === 0 && (
				<Text fontSize="0.8rem" color="fg.muted" mt={1}>
					Opcional, hasta {maxFiles} fotos.
				</Text>
			)}
			{previews.length > 0 && (
				<SimpleGrid columns={5} gap={2} mt={3} maxW="320px">
					{previews.map((url, index) => (
						<Box key={url} position="relative">
							<Image src={url} alt={files[index]?.name} borderRadius="md" objectFit="cover" boxSize="60px" />
							<IconButton
								type="button"
								aria-label="Quitar foto"
								size="2xs"
								position="absolute"
								top="-6px"
								right="-6px"
								borderRadius="full"
								colorPalette="red"
								onClick={() => removeFile(index)}
							>
								<Trash />
							</IconButton>
						</Box>
					))}
				</SimpleGrid>
			)}
		</Box>
	);
}
