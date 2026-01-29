import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreHorizontal, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "new":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
    case "contacted":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
    case "qualified":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100/80";
    case "converted":
      return "bg-green-100 text-green-700 hover:bg-green-100/80";
    case "lost":
      return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
  }
};

export function LeadsTable() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact-messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const data = await response.json();
        setLeads(data.messages || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Could not load leads");
        // Keep empty leads array
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <Card className="border-slate-100 shadow-sm" id="leads">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Leads</CardTitle>
          <CardDescription>
            Manage your recent inquiries and customers.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          View All <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-slate-500">
            <p>{error}</p>
            <p className="text-xs mt-2">Check backend connection</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 border rounded-md border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No leads found</p>
            <p className="text-xs text-slate-400 mt-1">New inquiries will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Event Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border hidden sm:flex">
                        <AvatarFallback className="bg-rose-50 text-rose-600 font-medium">
                          {lead.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500 hidden sm:block">{lead.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">
                    {lead.event_date ? new Date(lead.event_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`rounded-md font-normal ${getStatusColor(lead.status)}`}>
                      {lead.status || 'New'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
