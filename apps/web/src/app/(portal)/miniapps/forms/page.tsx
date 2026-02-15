import { redirect } from 'next/navigation';

import { FormsMiniApp } from '../../../../components/forms/FormsMiniApp';
import { PageContainer } from '../../../../components/layout/PageContainer';
import { readSession } from '../../../../lib/auth/session';

type FormsPageProps = {
  searchParams?: {
    formId?: string;
  };
};

export default async function FormsPage({ searchParams }: FormsPageProps) {
  const session = await readSession();

  if (!session) {
    redirect('/auth/login');
  }

  const formId = searchParams?.formId ?? 'inspection';

  return (
    <PageContainer
      title="Forms"
      subtitle="Submit operational checklists and digital forms."
    >
      <FormsMiniApp formId={formId} />
    </PageContainer>
  );
}
