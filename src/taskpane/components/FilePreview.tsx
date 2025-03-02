import * as React from 'react';
import { 
    Dialog, 
    DialogType, 
    DialogFooter,
    PrimaryButton,
    Link,
    Stack,
    Text,
    IStackTokens,
    Icon
} from '@fluentui/react';
import { ProcessedFile } from '../models/types';

export interface FilePreviewProps {
    file: ProcessedFile | null;
    isOpen: boolean;
    onDismiss: () => void;
}

const stackTokens: IStackTokens = { childrenGap: 10 };

const FilePreview: React.FC<FilePreviewProps> = (props) => {
    const { file, isOpen, onDismiss } = props;
    const [dataUrl, setDataUrl] = React.useState<string | null>(null);
    const [previewError, setPreviewError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (file && file.fileData) {
            setDataUrl(file.fileData);
            setPreviewError(null);
        } else if (file) {
            setPreviewError("Preview is not available for this file.");
            setDataUrl(null);
        }
    }, [file]);

    if (!file) {
        return null;
    }

    const dialogContentProps = {
        type: DialogType.normal,
        title: `Preview: ${file.name}`,
        closeButtonAriaLabel: 'Close',
        subText: `File type: ${file.type}, Size: ${formatFileSize(file.size)}`
    };

    // Format file size for display
    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Determine if file is an image type
    const isImage = file.type.includes('image');
    // Determine if file is a PDF
    const isPdf = file.type.includes('pdf');

    const containerStyle: React.CSSProperties = {
        minWidth: '800px',
        minHeight: '400px',
        width: '100%',
        height: '70vh',
        overflow: 'auto',
        border: '1px solid #f3f2f1',
        borderRadius: '2px',
        backgroundColor: '#ffffff'
    };

    return (
        <Dialog
            hidden={!isOpen}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={{
                isBlocking: false,
                styles: { 
                    main: { 
                        minWidth: '850px',  // Extra space for borders and padding
                        minHeight: '500px', // Extra space for header and footer
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        width: 'auto'
                    },
                    scrollableContent: {
                        minHeight: '450px'
                    }
                }
            }}
        >
            <div style={{ padding: '0px', margin: '0 0 20px 0' }}>
                {previewError && (
                    <Text style={{ color: 'red', padding: '20px' }}>{previewError}</Text>
                )}

                {!previewError && (
                    <>
                        {/* Image Preview */}
                        {isImage && dataUrl && (
                            <div style={containerStyle}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    minHeight: '100%'
                                }}>
                                    <img
                                        src={dataUrl}
                                        alt={file.name}
                                        style={{
                                            maxWidth: 'none', // Allow original size
                                            margin: '0 auto'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* PDF Preview */}
                        {isPdf && dataUrl && (
                            <div style={containerStyle}>
                                <object
                                    data={dataUrl}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                >
                                    <Text>
                                        Your browser does not support PDF preview.{' '}
                                        <Link href={dataUrl} target="_blank">Open PDF</Link>
                                    </Text>
                                </object>
                            </div>
                        )}

                        {/* Fallback for other file types or when no preview is available */}
                        {!isImage && !isPdf && (
                            <div style={{
                                ...containerStyle,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '20px'
                            }}>
                                <Icon iconName={
                                    file.type.includes('document') ? 'Document' :
                                    file.type.includes('text') ? 'TextDocument' :
                                    'Page'
                                } style={{ fontSize: '72px', marginBottom: '20px' }} />
                                <Text variant="large">This file type cannot be previewed directly.</Text>
                                {file.status === 'processed' && (
                                    <Text style={{ marginTop: '10px' }}>
                                        The content has been processed with OCR and is searchable.
                                    </Text>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <DialogFooter>
                <PrimaryButton onClick={onDismiss} text="Close" />
            </DialogFooter>
        </Dialog>
    );
};

export default FilePreview; 