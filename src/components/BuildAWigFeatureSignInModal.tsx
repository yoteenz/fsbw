import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';

type Loc = { pathname: string; search?: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Where the user returns after signing in (e.g. current PDP or `/build-a-wig?bawMenu=1`). */
  returnTo: Loc;
};

/**
 * Gate for Build-a-Wig entry points when the user must sign in first.
 */
export default function BuildAWigFeatureSignInModal({ isOpen, onClose, returnTo }: Props) {
  const navigate = useNavigate();
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => navigate(signInHrefWithReturnTo(returnTo))}
      title="FORGOT SOMETHING?"
      message="You must sign in to access this feature."
      confirmText="SIGN IN"
      cancelText="CANCEL"
      dataAttribute="build-a-wig-sign-in-modal"
    />
  );
}
