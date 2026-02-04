
import React, { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
    initialValue: string;
    onSave: (val: string) => void;
    isEditing: boolean;
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
    placeholder?: string;
    type?: 'text' | 'date';
}

export const EditableText = ({
    initialValue,
    onSave,
    isEditing,
    className = '',
    tag: Tag = 'p',
    placeholder = 'Click to edit',
    type = 'text'
}: EditableTextProps) => {
    const [text, setText] = useState(initialValue);
    const elementRef = useRef<any>(null);

    useEffect(() => {
        setText(initialValue);
        if (elementRef.current) {
            elementRef.current.innerText = initialValue;
        }
    }, [initialValue]);

    const handleBlur = () => {
        if (!elementRef.current) return;
        const newText = elementRef.current.innerText;
        if (newText !== text) {
            setText(newText);
            onSave(newText);
        }
    };

    if (!isEditing) {
        return <Tag className={className}>{text}</Tag>;
    }

    if (type === 'date') {
        return (
            <div className="relative group inline-block">
                <input
                    type="date"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        onSave(e.target.value);
                    }}
                    className={`${className} outline-none border border-dashed border-rose-300 bg-rose-50/50 rounded px-2 cursor-pointer transition-all`}
                />
            </div>
        );
    }

    return (
        <div className="relative group inline-block max-w-full">
            <Tag
                ref={elementRef}
                className={`${className} outline-none border border-transparent hover:border-dashed hover:border-rose-400 hover:bg-rose-50/50 rounded cursor-text transition-all min-w-[20px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBlur}
                data-placeholder={placeholder}
            >
                {/* Text is managed via ref and innerText to avoid cursor jumping */}
            </Tag>
            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-rose-500 text-white p-1 rounded-full shadow-sm">
                    <Pencil className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};
