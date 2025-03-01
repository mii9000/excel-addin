import * as React from 'react';
import {
    List,
    IconButton,
    Text,
    Stack,
    ProgressIndicator,
    TooltipHost,
    Icon
} from '@fluentui/react';
import { ProcessedFile } from '../models/types';

export interface FileListProps {
    files: ProcessedFile[];
    onRemoveFile: (fileId: string) => void;
}

const FileList: React.FC<FileListProps> = (props) => {
    const { files, onRemoveFile } = props;

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Render each file item
    const renderFile = (file: ProcessedFile): JSX.Element => {
        return (
            <div className="file-item" key={file.id}>
                <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center" style={{ width: '100%' }}>
                    {/* File icon based on type */}
                    <Icon iconName={
                        file.type.includes('pdf') ? 'PDF' :
                        file.type.includes('image') ? 'Photo' : 'Document'
                    } />
                    
                    {/* File info */}
                    <Stack grow>
                        <Text>{file.name}</Text>
                        <Text variant="small">{formatFileSize(file.size)}</Text>
                    </Stack>
                    
                    {/* Processing status indicator */}
                    <Stack style={{ width: 120 }}>
                        {file.status === 'processing' ? (
                            <ProgressIndicator label="Processing..." />
                        ) : file.status === 'processed' ? (
                            <TooltipHost content="Processing complete">
                                <Icon iconName="CheckMark" style={{ color: 'green' }} />
                            </TooltipHost>
                        ) : (
                            <TooltipHost content="Error processing file">
                                <Icon iconName="Error" style={{ color: 'red' }} />
                            </TooltipHost>
                        )}
                    </Stack>
                    
                    {/* Remove button */}
                    <IconButton
                        iconProps={{ iconName: 'Delete' }}
                        title="Remove file"
                        ariaLabel="Remove file"
                        onClick={() => onRemoveFile(file.id)}
                    />
                </Stack>
            </div>
        );
    };

    return (
        <div>
            {files.length > 0 ? (
                <List
                    items={files}
                    onRenderCell={renderFile}
                />
            ) : (
                <Text>No files imported yet.</Text>
            )}
        </div>
    );
};

export default FileList; 