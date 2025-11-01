import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const QuestionContentRenderer = ({ htmlContent }) => {
    const containerRef = useRef(null);

    const cleanHtml = DOMPurify.sanitize(htmlContent || '', { // Thêm || '' để tránh lỗi nếu null
        ADD_TAGS: ['span'], 
        ADD_ATTR: ['class', 'data-value'] // Cho phép data-value
    });

    useEffect(() => {
        if (containerRef.current) {
            const formulaElements = containerRef.current.querySelectorAll(".ql-formula");
            
            formulaElements.forEach(element => {
                const latex = element.getAttribute('data-value') || element.textContent; // Ưu tiên data-value
                if (latex) {
                    try {
                        katex.render(latex, element, {
                            throwOnError: false, 
                            displayMode: false 
                        });
                    } catch (e) {
                        console.warn("KaTeX render error:", e, "on", latex);
                        element.textContent = `[Lỗi LaTeX: ${latex}]`;
                    }
                }
            });
        }
    }, [cleanHtml]); // Chạy lại khi nội dung thay đổi

    return (
        <div 
            ref={containerRef} 
            dangerouslySetInnerHTML={{ __html: cleanHtml }} 
            // Thêm style nếu cần (ví dụ: giới hạn chiều cao, font chữ)
            style={{ 
                maxHeight: '3em', // Giới hạn chiều cao trong bảng
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                // whiteSpace: 'nowrap' // Bỏ nowrap để xem nhiều dòng hơn nếu cần
            }}
        />
    );
};

export default QuestionContentRenderer;