import React from 'react';
import BottomSheet from '../ui/BottomSheet';
import AthleteInviteForm from '../forms/AthleteInviteForm';

const RecruitHeroesModal = ({ isOpen, onClose, onSuccess }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Recruit New Heroes"
        >
            <AthleteInviteForm
                onSuccess={() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }}
                onCancel={onClose}
            />
        </BottomSheet>
    );
};

export default RecruitHeroesModal;
