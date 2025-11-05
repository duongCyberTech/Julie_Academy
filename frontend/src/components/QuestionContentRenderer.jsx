import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const QuestionContentRenderer = ({ htmlContent }) => {
    const containerRef = useRef(null);

    const cleanHtml = DOMPurify.sanitize(htmlContent || '', { 
        ADD_TAGS: ['span'], 
        ADD_ATTR: ['class', 'data-value'] 
    });

    useEffect(() => {
        if (containerRef.current) {
            const formulaElements = containerRef.current.querySelectorAll(".ql-formula");
            
            formulaElements.forEach(element => {
                const latex = element.getAttribute('data-value') || element.textContent; 
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
    }, [cleanHtml]); 

    return (
        <div 
            ref={containerRef} 
            dangerouslySetInnerHTML={{ __html: cleanHtml }} 
            style={{ 
                maxHeight: '3em', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
            }}
        />
    );
};

export default QuestionContentRenderer;