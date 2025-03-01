export default async function CreditsLoader() {
  const auth = localStorage.getItem("DST");

  const response = await fetch(
    `${process.env.BASE_URL}/credits/get_credit_requests`,
    {
      headers: { Authorization: `Bearer ${auth}` },
      method: "GET",
    }
  );

  const res = await response.json();
  return res.data.credit_requests;
}
