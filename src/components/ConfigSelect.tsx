export function ConfigSelect({ value, options, disabled, onChange }: {
    value: string;
    options: string[];
    disabled?: boolean;
    onChange: (name: string) => void;
}) {
    return (
        <label className="config-select">
            <span className="config-select-label">Sound bank</span>
            <span className="config-select-wrap">
                <select
                    value={value}
                    disabled={disabled}
                    onChange={e => onChange(e.target.value)}
                >
                    {options.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <span className="config-select-arrow" aria-hidden="true">▾</span>
            </span>
        </label>
    );
}
