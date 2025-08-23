 "use client";

 import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetDescription,
   SheetTitle,
 } from "@/components/ui/sheet";
 import { Badge } from "@/components/ui/badge";
 import type { Candidate } from "@/lib/types/types";
 import {
   MapPin,
   Clock,
   DollarSign,
   Globe,
   GraduationCap,
   ExternalLink,
 } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";

 interface CandidateDetailsProps {
   candidate: Candidate;
   open: boolean;
   onClose: () => void;
 }

export function CandidateDetails({
    candidate,
    open,
    onClose,
}: CandidateDetailsProps) {
    return (<Sheet open={open} onOpenChange={onClose}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                </SheetDescription>
            </SheetHeader>
        </SheetContent>
    </Sheet>)
}