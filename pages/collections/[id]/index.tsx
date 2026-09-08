import CollectionForm from "@/components/pages/collections/collection-form";
import { useRouter } from "next/router";
import { useEffect } from "react";

const EditCollectionPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  useEffect(() => {
    document.title = "Edit Collection | Shipro Africa";
  }, []);

  if (!id) return null;

  return <CollectionForm mode="edit" collectionId={id} />;
};

export default EditCollectionPage;
