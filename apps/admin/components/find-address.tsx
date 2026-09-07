import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { useState } from "react";
import { type Address, DaumPostcodeEmbed } from "react-daum-postcode";

type Props = {
  onCompleted: (address: Address) => void;
  readonly?: boolean;
};

const FindAddress = ({ onCompleted, readonly }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!readonly && (
        <DialogTrigger asChild>
          <Button className="shrink-0">주소검색</Button>
        </DialogTrigger>
      )}
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <DaumPostcodeEmbed
          onComplete={(address) => {
            onCompleted(address);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FindAddress;
