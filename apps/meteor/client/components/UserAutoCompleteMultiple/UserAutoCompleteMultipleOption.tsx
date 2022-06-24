import { IUser } from '@rocket.chat/core-typings';
import { Option, OptionDescription } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import UserAvatar from '../avatar/UserAvatar';

type UserAutoCompleteMultipleOptionProps = {
	label: {
		_federated?: boolean;
	} & Pick<IUser, 'username' | 'name'>;
};

const UserAutoCompleteMultipleOption = ({ label, ...props }: UserAutoCompleteMultipleOptionProps): ReactElement => {
	const { name, username, _federated } = label;

	return (
		<Option
			{...props}
			avatar={_federated ? undefined : <UserAvatar username={username || ''} size='x20' />}
			icon={_federated ? 'globe' : undefined}
			key={username}
			label={
				<>
					{name || username} {!_federated && <OptionDescription>({username})</OptionDescription>}
				</>
			}
		/>
	);
};

export default UserAutoCompleteMultipleOption;
