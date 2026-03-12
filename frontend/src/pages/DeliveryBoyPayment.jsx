import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineKeyboardBackspace, MdDeliveryDining } from 'react-icons/md';
import { FaMoneyBillWave, FaGift, FaStar, FaTrophy } from 'react-icons/fa';
import { BiTimer } from 'react-icons/bi';
import Nav from '../components/Nav';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const PRIMARY = '#ff4d2d';

function DeliveryBoyPayment() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({
        daily: { deliveries: 0, basePayment: 0, bonus: 0, total: 0, peakHourDeliveries: 0, peakHourBonus: 0 },
        weekly: { deliveries: 0, basePayment: 0, bonus: 0, total: 0, peakHourDeliveries: 0, peakHourBonus: 0 },
        monthly: { deliveries: 0, basePayment: 0, bonus: 0, total: 0, peakHourDeliveries: 0, peakHourBonus: 0 }
    });

    useEffect(() => {
        fetchPaymentData();
    }, []);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            const [daily, weekly, monthly] = await Promise.all([
                axios.get(`${serverUrl}/api/order/payment/daily`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/order/payment/weekly`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/order/payment/monthly`, { withCredentials: true })
            ]);

            console.log('Payment Data:', { daily: daily.data, weekly: weekly.data, monthly: monthly.data });

            setPaymentData({
                daily: {
                    deliveries: daily.data.deliveries || 0,
                    basePayment: daily.data.basePayment || 0,
                    bonus: daily.data.bonus || 0,
                    total: daily.data.total || 0,
                    peakHourDeliveries: daily.data.peakHourDeliveries || 0,
                    peakHourBonus: daily.data.peakHourBonus || 0
                },
                weekly: {
                    deliveries: weekly.data.deliveries || 0,
                    basePayment: weekly.data.basePayment || 0,
                    bonus: weekly.data.bonus || 0,
                    total: weekly.data.total || 0,
                    peakHourDeliveries: weekly.data.peakHourDeliveries || 0,
                    peakHourBonus: weekly.data.peakHourBonus || 0
                },
                monthly: {
                    deliveries: monthly.data.deliveries || 0,
                    basePayment: monthly.data.basePayment || 0,
                    bonus: monthly.data.bonus || 0,
                    total: monthly.data.total || 0,
                    peakHourDeliveries: monthly.data.peakHourDeliveries || 0,
                    peakHourBonus: monthly.data.peakHourBonus || 0
                }
            });
        } catch (error) {
            console.error('Payment fetch error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to fetch payment data');
        } finally {
            setLoading(false);
        }
    };

    const currentData = paymentData[activeTab];

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#fff1eb] to-[#fff9f6]">
            <Nav />
            
            <div className="w-full flex justify-center px-4 pb-14 pt-24">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="text-gray-600 hover:text-[#ff4d2d] transition-colors"
                            >
                                <MdOutlineKeyboardBackspace size={28} />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-[#ff4d2d] flex items-center gap-2">
                                    <FaMoneyBillWave />
                                    Payment Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Track your earnings and bonuses</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-3xl p-2 shadow-sm border flex gap-2">
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${
                                activeTab === 'daily'
                                    ? 'bg-[#ff4d2d] text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setActiveTab('weekly')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${
                                activeTab === 'weekly'
                                    ? 'bg-[#ff4d2d] text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setActiveTab('monthly')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${
                                activeTab === 'monthly'
                                    ? 'bg-[#ff4d2d] text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Monthly
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-3xl p-12 shadow-sm border flex justify-center">
                            <ClipLoader size={50} color={PRIMARY} />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Deliveries */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <MdDeliveryDining className="text-blue-600 text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Deliveries</p>
                                            <p className="text-3xl font-bold text-gray-800">{currentData.deliveries}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Base Payment */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 bg-green-50 rounded-xl">
                                            <FaMoneyBillWave className="text-green-600 text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Base Pay</p>
                                            <p className="text-3xl font-bold text-green-600">₹{currentData.basePayment}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bonus */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 bg-purple-50 rounded-xl">
                                            <FaGift className="text-purple-600 text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Bonus</p>
                                            <p className="text-3xl font-bold text-purple-600">₹{currentData.bonus}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Earnings */}
                            <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-3xl p-8 shadow-lg border border-orange-200">
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <p className="text-white/90 text-sm font-medium mb-2">
                                            {activeTab === 'daily' ? "Today's Earnings" : activeTab === 'weekly' ? "This Week's Earnings" : "This Month's Earnings"}
                                        </p>
                                        <p className="text-5xl font-bold">₹{currentData.total}</p>
                                        <p className="text-white/80 text-sm mt-3">
                                            Base: ₹{currentData.basePayment} + Bonus: ₹{currentData.bonus}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                        <FaTrophy className="text-6xl text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Peak Hour Bonus Card */}
                            {currentData.peakHourDeliveries > 0 && (
                                <div className="bg-white rounded-3xl p-6 shadow-sm border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-orange-50 rounded-xl">
                                            <BiTimer className="text-orange-600 text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Peak Hour Bonus</h3>
                                            <p className="text-sm text-gray-500">Deliveries during rush hours</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-orange-50 rounded-xl p-4">
                                            <p className="text-sm text-orange-700 font-medium">Peak Deliveries</p>
                                            <p className="text-2xl font-bold text-orange-600">{currentData.peakHourDeliveries}</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-4">
                                            <p className="text-sm text-orange-700 font-medium">Peak Bonus</p>
                                            <p className="text-2xl font-bold text-orange-600">₹{currentData.peakHourBonus}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Conditions */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaStar className="text-yellow-500" />
                                    Payment Conditions
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FaMoneyBillWave className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Base Payment</p>
                                            <p className="text-sm text-gray-600">₹80 per delivery</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FaTrophy className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Milestone Bonuses</p>
                                            <p className="text-sm text-gray-600">10+ deliveries: ₹100 | 20+: ₹200 | 30+: ₹300</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <FaGift className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Weekly Bonus</p>
                                            <p className="text-sm text-gray-600">40+ deliveries in a week: ₹500 bonus</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <FaStar className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Monthly Incentive</p>
                                            <p className="text-sm text-gray-600">150+: ₹2000 | 180+: ₹3000 | 200+: ₹5000</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <BiTimer className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Peak Hour Bonus</p>
                                            <p className="text-sm text-gray-600">+₹20 per delivery (12-1pm, 7-9pm)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 shadow-sm border border-blue-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    💡 Pro Tips
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#ff4d2d] font-bold">•</span>
                                        <span>Focus on peak hours (lunch & dinner) for extra ₹20 per delivery bonus</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#ff4d2d] font-bold">•</span>
                                        <span>Complete 40+ deliveries weekly to unlock ₹500 bonus</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#ff4d2d] font-bold">•</span>
                                        <span>Aim for 200+ monthly deliveries for maximum ₹5000 incentive</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#ff4d2d] font-bold">•</span>
                                        <span>Accept nearby assignments for faster completion and more deliveries</span>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DeliveryBoyPayment;
