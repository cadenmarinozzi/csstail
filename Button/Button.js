import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Button.scss';

export default ({
	transparent,
	cta,
	label,
	icon,
	rightIcon,
	className,
	disabled,
	...rest
}) => {
	return (
		<button
			className={`button button-${
				cta
					? 'cta'
					: transparent
					? 'transparent'
					: disabled
					? 'disabled'
					: 'default'
			} ${className}`}
			{...rest}>
			{icon && <FontAwesomeIcon icon={icon} className='icon' />}
			{label}
			{rightIcon && <FontAwesomeIcon icon={rightIcon} className='icon' />}
		</button>
	);
};
