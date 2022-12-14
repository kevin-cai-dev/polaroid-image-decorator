import type { NextPage } from 'next';
import { useState, useRef, ChangeEvent, useEffect } from 'react';

import { createImage, healthCheck } from '@common/utils';
import { Disclaimer } from '@components/disclaimer';
import { ErrorAlert } from '@components/error-alert';
import { Footer } from '@components/footer';
import { GithubCorner } from '@components/github-corner';
import { Settings } from '@components/settings';

const Home: NextPage = () => {
    const [isDown, setIsDown] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [newImage, setNewImage] = useState<string>();
    const [evenBorder, setEvenBorder] = useState(false);
    const [borderWidth, setBorderWidth] = useState('md_borders');
    const [aspectRatio, setAspectRatio] = useState('ratio_1_1');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const pingBackend = async () => {
            const status = await healthCheck();
            if (status !== 200) {
                setIsDown(true);
            }
        };

        pingBackend();
    }, []);

    const settingsProps = {
        evenBorder,
        setEvenBorder,
        borderWidth,
        setBorderWidth,
        aspectRatio,
        setAspectRatio,
    };

    const onFileClick = () => {
        hiddenFileInput.current?.click();
    };

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        e.target.files && setSelectedFile(e.target.files[0]);
    };

    const getImage = async () => {
        const formData = new FormData();
        selectedFile && formData.append('file', selectedFile);
        formData.append('even_border', evenBorder.toString());
        formData.append('border_width_key', borderWidth);
        formData.append('aspect_ratio_key', aspectRatio);

        setNewImage(undefined);
        setErrorMessage('');
        setIsError(false);
        setIsLoading(true);
        const [response, error] = await createImage(formData);
        setIsLoading(false);
        if (error) {
            setErrorMessage(error);
            return setIsError(true);
        }
        setNewImage(response);
    };

    return (
        <div className="prose mx-auto flex min-h-screen max-w-screen-lg flex-col p-8 text-base-content">
            <GithubCorner />
            <h1 className="text-center font-sans font-bold">
                Polaroid Image Decorator
            </h1>
            <Disclaimer />
            {isDown && (
                <ErrorAlert error="Page is disabled as the backend is currently down. This is most likely because it is no longer being hosted." />
            )}
            <input
                type="file"
                name="image-upload"
                accept=".jpg, .jpeg, .png, .tiff, .webp"
                ref={hiddenFileInput}
                className="hidden"
                onChange={handleUpload}
                disabled={isDown}
            />
            <div>
                <button
                    className="btn btn-primary"
                    onClick={onFileClick}
                    disabled={isDown}
                >
                    Upload image
                </button>
                <span className="pl-4">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
            </div>

            <div className="divider" />

            <div className="flex flex-col gap-10">
                <Settings {...settingsProps} />
                <button
                    className="btn btn-secondary"
                    onClick={getImage}
                    disabled={!selectedFile || isDown}
                >
                    Generate!
                </button>
            </div>

            <div className="divider" />

            {isLoading && <progress className="progress progress-primary" />}
            {isError && <ErrorAlert error={errorMessage} />}
            {newImage && !isLoading && (
                <>
                    <a
                        href={newImage}
                        download={`POLAROID_${selectedFile?.name}`}
                        className="btn btn-accent"
                    >
                        Download image
                    </a>
                    <picture>
                        <source srcSet={newImage} type="image/jpeg" />
                        <img src={newImage} alt="" className="mx-auto" />
                    </picture>
                </>
            )}
            <Footer />
        </div>
    );
};

export default Home;
