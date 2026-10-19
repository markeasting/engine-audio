/** Displays a labeled dashboard value. */
export function ValueBox({
    value,
    label,
    size = 'normal',
}: {
    value: string | number;
    label: string;
    size?: 'normal' | 'large';
}) {
    return (
        <div className="value-box">
            <div className={`value-box-value value-box-value--${size}`}>
                {value}
            </div>
            <div className="value-box-label">{label}</div>
        </div>
    );
}