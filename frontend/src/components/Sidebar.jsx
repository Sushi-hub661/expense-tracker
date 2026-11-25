import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="sidebar">

            <div className="sidebar-logo">
                <h4>💰 Expense Tracker</h4>
            </div>

            {/* Navigation */}
            <ul className="sidebar-menu">

                <li>
                    <NavLink to="/" end>
                        📊 Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/transactions">
                        💳 Transactions
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/categories">
                        🏷️ Categories
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/budgets">
                        💰 Budgets
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/reports">
                        📈 Reports
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/settings">
                        ⚙️ Settings
                    </NavLink>
                </li>

            </ul>
            {/* Footer */}
            <div className="sidebar-footer">
                <p>Expense Tracker v1.0</p>
            </div>

        </div>
    );
}

export default Sidebar;
