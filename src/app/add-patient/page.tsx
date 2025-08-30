'use client';

import { useRouter } from 'next/navigation';
import AddPatientForm from '@/components/AddPatientForm';
import Layout from '@/components/Layout';

export default function AddPatientPage() {
  const router = useRouter();

  const handlePatientAdded = () => {
    // Redirect to patients list after successful addition
    setTimeout(() => {
      router.push('/patients');
    }, 2000);
  };

  return (
    <Layout 
      title="Add New Patient" 
      subtitle="Fill in the patient information below."
    >
      <AddPatientForm onPatientAdded={handlePatientAdded} />
    </Layout>
  );
}
