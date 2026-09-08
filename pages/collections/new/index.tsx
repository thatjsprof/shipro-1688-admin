import CollectionForm from "@/components/pages/collections/collection-form";
import { useEffect } from "react";

const NewCollectionPage = () => {
  useEffect(() => {
    document.title = "New Collection | Shipro Africa";
  }, []);

  return <CollectionForm mode="create" />;
};

export default NewCollectionPage;
