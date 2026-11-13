import { ChevronDown } from 'lucide-react';
import { indianStates } from '../../utils/indianStates';
import styles from './StateDropdown.module.css';


function StateDropdown({ value, onChange, name = 'state', id = 'state' }) {
  return (
    <div className={styles.wrapper}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={styles.select}
      >
        <option value="">Select state</option>
        {indianStates.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <ChevronDown size={16} className={styles.chevron} />
    </div>
  );
}

export default StateDropdown;
