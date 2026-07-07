import { Navigate } from 'react-router-dom';
import { adminStudioKnowledgeRegistryPath } from '../../../../utils/adminStudioRoutes';

/** @deprecated Redirect to Studio OS Knowledge Registry™ */
export default function AdminStudioDocumentationRegistryPage() {
  return <Navigate to={adminStudioKnowledgeRegistryPath()} replace />;
}
