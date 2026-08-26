import { Navigate } from 'react-router-dom';
import { CHARACTER_LAB_BASE_PATH } from '../../../../components/admin/studio/character-lab/characterLabConfig';

export default function AdminStudioCharacterLabPage() {
  return <Navigate to={`${CHARACTER_LAB_BASE_PATH}/character`} replace />;
}
