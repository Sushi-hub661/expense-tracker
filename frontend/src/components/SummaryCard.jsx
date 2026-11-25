function SummaryCard({ title, amount, icon, color, subtitle }) {
    return (
        <div className="summary-card">

            <div className="summary-card-header">
                <span>{title}</span>
                <span className={`summary-icon ${color}`}>
                    {icon}
                </span>
            </div>

            <h3>{amount}</h3>

            <small>{subtitle}</small>

        </div>
    );
}

export default SummaryCard;
